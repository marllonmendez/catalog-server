import { FastifyInstance } from 'fastify'
import { z, ZodError } from 'zod'
import dayjs from 'dayjs'
import slugify from 'slugify'

import prisma from '../services/prisma'
import cloudinary from '../services/cloudinary'

export async function Routes(app: FastifyInstance) {
  app.post('/product', async (req, res) => {
    try {
      // Captura o arquivo e os campos do formulário.
      const data = await req.file()
      if (!data) {
        throw new Error('A imagem é obrigatória!')
      }

      // Acessa os valores dos campos.
      const fields = data.fields as { [key: string]: { value: string } }
      const name = fields.name.value
      const priceString = fields.price.value
        .replace('R$ ', '')
        .replace('.', '')
        .replace(',', '.')
        .trim()
      const price = parseFloat(priceString)

      // Descreve o formato esperado dos dados conforme o schema.
      const createProductSchema = z.object({
        name: z.string(),
        price: z.number(),
      })

      // Faz a validação dos dados e verifica se eles correspondem às regras definidas no schema.
      const validatedData = createProductSchema.parse({ name, price })

      // Geração do Slug do Produto.
      const slug = slugify(validatedData.name, { lower: true, strict: true }).replace('percent', '')

      // Faz o upload da imagem para o Cloudinary.
      const uploadImageToCloudinary = () => {
        return new Promise<{ secure_url: string }>((resolve, reject) => {
          const stream = cloudinary.v2.uploader.upload_stream(
            { folder: 'catalog', resource_type: 'image', },
            (error, result) => {
              if (error || !result) {
                reject(new Error('Falha no upload da imagem!'))
              } else {
                resolve(result)
              }
            }
          )
          data.file.pipe(stream)
        })
      }

      const uploadImage = await uploadImageToCloudinary()
      const today = dayjs().toDate()

      // Verifica se o produto já existe com base no nome, que deve ser único.
      const possibleProduct = await prisma.product.findUnique({
        where: { name: validatedData.name },
      })

      if (possibleProduct) {
        throw new Error('O Produto já está cadastrado!')
      }

      // Cria o novo produto no banco de dados.
      await prisma.product.create({
        data: {
          name: validatedData.name,
          price: validatedData.price,
          image: uploadImage.secure_url,
          slug: slug,
          created_at: today,
        },
      })

      return res.status(200).send({ message: 'Produto criado com sucesso' });
    } catch (err: any) {
      if (err instanceof ZodError) {
        return res.status(400).send({
          validationError: true,
          message: 'Erro de validação',
          fields: err.errors.map(error => error.path.join('.')),
        })
      }
      return res.status(500).send({ message: err.message });
    }
  })

  app.get('/products', async (req, res) => {
    try {
      const products = await prisma.product.findMany({
        select: {
          id: true,
          name: true,
          price: true,
          image: true,
          slug: true,
        },
      })

      return res.status(200).send(products);
    } catch (err: any) {
      return res.status(500).send({ message: err.message })
    }
  })

  app.get('/product/:slug', async (req, res) => {
    try {
      const { slug } = req.params as { slug: string }

      const product = await prisma.product.findUnique({
        where: { slug }
      })

      if (!product) {
        return res.status(404).send({message: 'Produto não encontrado'})
      }

      return res.status(200).send(product)
    } catch (err: any) {
      return res.status(500).send({message: err.message})
    }
  })

  app.put('/product/:slug', async (req, res) => {
    try {
      const { slug } = req.params as { slug: string }
      const { name, price } = req.body as { name: string, price: number }

      const newSlug = slugify(name, { lower: true, strict: true }).replace('percent', '')

      const updated = await prisma.product.update({
        where: { slug },
        data: { name, price, slug: newSlug },
      })

      return res.status(200).send(updated)
    } catch (err: any) {
      return res.status(500).send({ message: err.message })
    }
  })

  app.delete('/product/:slug', async (req, res) => {
    try {
      const { slug } = req.params as { slug: string }

      const product = await prisma.product.findUnique({
        where: { slug }
      })

      if (!product) {
        return res.status(404).send({message: 'Produto não encontrado'})
      }

      const image = product.image
      const publicId = image.split('/').slice(-1)[0].split('.')[0]

      await cloudinary.v2.api.delete_resources([`catalog/${publicId}`], {
        type: 'upload', resource_type: 'image'
      })

      const productDeleted = await prisma.product.delete({
        where: { slug },
      })

      return res.status(200).send(productDeleted)
    } catch (err: any) {
      return res.status(500).send({ message: err.message })
    }
  })
}
