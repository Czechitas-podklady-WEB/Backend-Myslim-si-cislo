import cors from 'cors'
import express from 'express'

const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())

const port = parseInt(process.env.PORT || '', 10)
if (!port) {
	throw new Error('PORT environment variable not set to a number.')
}

app.use(express.static('public'))

const apiRouter = express.Router()
app.use('/api', apiRouter)

// 404

apiRouter.use((request, response) => {
	response.status(404).send({
		status: 'error',
		message: 'Not found.',
	})
})

app.listen(port, () => {
	console.log(`App listening at port ${port}`)
})
