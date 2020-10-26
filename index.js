import cors from 'cors'
import express from 'express'
import { cyrb53 } from './utils/cyrb53.js'
import { randomPhrases } from './utils/randomPhrases.js'

const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())

const port = parseInt(process.env.PORT || '', 10)
if (!port) {
	throw new Error('PORT environment variable not set to a number.')
}

app.use(express.static('public'))

const createNumber = (min, max, id) => {
	const hash = cyrb53(`${min}-${max}-${id}`)

	return min + (hash % (max - min + 1))
}

const createPassword = (min, max, id) => {
	const index = createNumber(0, randomPhrases.length - 1, `${min}-${max}-${id}`)
	return randomPhrases[index]
}

app.set('view engine', 'pug')

// Home

app.get('/', (request, response) => {
	response.render('index')
})

// Game

app.get('/nahodne-cislo/od/:from/do/:to/id/:id/', (request, response) => {
	const { id } = request.params
	const min = parseInt(request.params.from, 10) || 1
	const max = Math.max(min + 1, parseInt(request.params.to, 10) || 1)
	const guess = parseInt(request.query.tip, 10) || 0
	const isGuessing = request.query.tip !== undefined

	const limits = { min, max }

	if (!isGuessing) {
		response.render('rules', { min, max })
		return
	}

	const target = createNumber(min, max, id)

	if (guess === target) {
		response.send({
			message: `Trefa. 🎉 Opravdu jsem si myslel číslo ${target}. Za odměnu ti prozradím tajné heslo „${createPassword(
				min,
				max,
				id,
			)}“.`,
			code: 'MATCH',
		})
		return
	}

	if (guess < target) {
		response.send({
			message: `Myslím si větší číslo než ${guess}. Zkus to znovu.`,
			code: 'GUESS_TOO_LOW',
			...limits,
		})
	} else {
		response.send({
			message: `Myslím si menší číslo než ${guess}. Zkus to znovu.`,
			code: 'GUESS_TOO_HIGH',
			...limits,
		})
	}
})

// 404

app.use((request, response) => {
	response.status(404).send({
		status: 'error',
		message: 'Not found.',
	})
})

app.listen(port, () => {
	console.log(`App listening at port ${port}`)
})
