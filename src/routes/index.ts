import { FastifyInstance } from 'fastify'
import { z, ZodError } from 'zod'
import dayjs from 'dayjs'
import slugify from 'slugify'

import prisma from '../services/prisma'
import cloudinary from '../services/cloudinary'

const validateProduct = (name: string, price: string) => {
  const createProductSchema = z.object({
    name: z.string(),
    price: z.number(),
  })

  const formattedPriceField = parseFloat(
    price
      .replace('R$ ', '')
      .replace('.', '')
      .replace(',', '.')
      .trim()
  )

  return createProductSchema.parse({ name, price: formattedPriceField })
}

const generateSlug = (slug: string) => {
  return slugify(slug, { lower: true, strict: true }).replace('percent', '')
}

const validateAndExtractData = async (request: any) => {
  const data = await request.file()
  if (!data || !data.file || !data.fields) {
    throw new Error('A imagem e os campos do formulário são obrigatórios!')
  }
  return data
}

const checkProductExistsByName = async (name: string) => {
  const findProductName = await prisma.product.findUnique({
    where: { name },
  })

  if (findProductName) {
    throw new Error('O Produto já está cadastrado!')
  }
}

const checkProductExistsBySlug = async (slug: string, reply: any) => {
  const findProductSlug = await prisma.product.findUnique({
    where: { slug },
  })

  if (!findProductSlug) {
    return reply.status(404).send({message: 'Produto não encontrado'})
  }

  return findProductSlug
}

const uploadImageToCloudinary = (file: any) => {
  return new Promise<{ secure_url: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'catalog',
        resource_type: 'image',
        transformation: [
          {
            width: 500,
            height: 500,
            crop: 'fill'
          }
        ]
      },
      (error, result) => {
        if (error || !result) {
          reject(new Error('Falha no upload da imagem!'))
        } else {
          resolve(result)
        }
      }
    )
    file.pipe(stream)
  })
}

export async function Routes(app: FastifyInstance) {
  app.post('/product', async (request, reply) => {
    try {
      const data = await validateAndExtractData(request)
      const fields = data.fields as { [key: string]: { value: string } }
      const { name, price } = fields
      const validated = validateProduct(name.value, price.value)

      await checkProductExistsByName(validated.name)
      const uploadImage = await uploadImageToCloudinary(data.file)
      const today = dayjs().toDate()

      await prisma.product.create({
        data: {
          name: validated.name,
          price: validated.price,
          image: uploadImage.secure_url,
          slug: generateSlug(validated.name),
          created_at: today,
        },
      })

      return reply.status(200).send({ message: 'Produto criado com sucesso' })
    } catch (err: any) {
      if (err instanceof ZodError) {
        return reply.status(400).send({
          validationError: true,
          message: 'Erro de validação',
          fields: err.errors.map(error => error.path.join('.')),
        })
      }
      return reply.status(500).send({ message: err.message });
    }
  })

  app.get('/products', async (_, reply) => {
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

      return reply.status(200).send(products);
    } catch (err: any) {
      return reply.status(500).send({ message: err.message })
    }
  })

  app.get('/product/:slug', async (request, reply) => {
    try {
      const { slug } = request.params as { slug: string }

      const product = await checkProductExistsBySlug(slug, reply)

      return reply.status(200).send(product)
    } catch (err: any) {
      return reply.status(500).send({message: err.message})
    }
  })

  app.put('/product/:slug', async (request, reply) => {
    try {
      const { slug } = request.params as { slug: string }
      const { name, price } = request.body as { name: string, price: number }

      const updated = await prisma.product.update({
        where: { slug },
        data: {
          name,
          price,
          slug: generateSlug(name)
        },
      })

      return reply.status(200).send(updated)
    } catch (err: any) {
      return reply.status(500).send({ message: err.message })
    }
  })

  app.delete('/product/:slug', async (request, reply) => {
    try {
      const { slug } = request.params as { slug: string }

      const product = await checkProductExistsBySlug(slug, reply)
      const publicId = product.image.split('/').slice(-1)[0].split('.')[0]

      await cloudinary.api.delete_resources([`catalog/${publicId}`], {
        type: 'upload', resource_type: 'image'
      })

      const productDeleted = await prisma.product.delete({
        where: { slug },
      })

      return reply.status(200).send(productDeleted)
    } catch (err: any) {
      return reply.status(500).send({ message: err.message })
    }
  })
}
