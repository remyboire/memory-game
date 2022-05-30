// I am creating a memory game

const submit = document.querySelector('.start-game')
const setup = document.querySelector('.setup')
let content
let gameStarted = false
let gameState = 'setup'
var interval
var sec = 1
var min = 0

const icons =
	// random font-awesome icons
	[
		'fa-carrot',
		'fa-camera-retro',
		'fa-broom-ball',
		'fa-crow',
		'fa-dog',
		'fa-feather-pointed',
		'fa-horse-head',
		'fa-key',
		'fa-kiwi-bird',
		'fa-motorcycle',
		'fa-oil-can',
		'fa-screwdriver',
		'fa-shoe-prints',
		'fa-skull-crossbones',
		'fa-star',
		'fa-user-secret',
		'fa-wine-bottle',
		'fa-wrench',
	]

class Card {
	constructor(theme, value, order) {
		this.theme = theme
		this.value = value
		this.order = order
		this.flipped = false
		this.found = false
	}
}
class Game {
	constructor(players, theme, size) {
		this.players = players
		this.theme = theme
		this.size = size
		this.board = []
		this.moves = new Array()
		this.currentMoves = new Array()
		this.move = 0
		this.score = []
		this.playerTurn = 1
	}

	createCards() {
		for (let i = 0; i < 2; i++) {
			for (let i = 0; i < (this.size * this.size) / 2; i++) {
				this.board.push(new Card(this.theme, i + 1))
			}
		}
	}
	shuffleCards() {
		this.board.sort(() => Math.random() - 0.5)
		this.board.forEach((card, index) => {
			card.order = index
		})
	}
	createBoard() {
		let cards
		if ((cards = document.querySelectorAll('.card'))) {
			cards.forEach((card) => card.remove())
		}
		const board = document.querySelector('.board')
		board.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`
		board.style.gridTemplateRows = `repeat(${this.size}, 1fr)`
		for (let i = 0; i < this.board.length; i++) {
			const card = document.createElement('div')
			card.classList.add('card')
			card.classList.add(this.theme)
			card.dataset.cardNumber = [i]
			card.dataset.size = this.size
			card.innerHTML = `<div class="back"></div>`
			board.appendChild(card)
		}
		this.boundEventHandler = this.handleClick.bind(this)
		board.addEventListener('click', this.boundEventHandler)
	}
	setScores() {
		const scores = document.querySelector('.scores')
		if (this.players == 1) {
			this.score.push({ player: 1, value: 0 })
			scores.innerHTML = `
			<div class="time score">time<span class="time-number font-big">0:00</span></div>
			<div class="move score">move<span class="move-number font-big">0</span></div>
			`
		} else {
			scores.innerHTML = ''
			for (let i = 0; i < this.players; i++) {
				this.score.push({ player: i + 1, value: 0, winner: false })
				scores.innerHTML += `
				<div class="player${i + 1} score ${i == 0 ? 'active' : ''}"><span><span class="player-name">Player</span> <span>${i + 1}</span></span><span class="player${
					i + 1
				}-number font-big">0</span></div>
				`
			}
		}
	}
	compareMoves() {
		if (this.currentMoves.length === 2) {
			this.move++

			if (this.currentMoves[0].value === this.currentMoves[1].value) {
				this.currentMoves.forEach((card) => {
					card.found = true
					document.querySelector('[data-card-number="' + card.order + '"]').classList.add('found')
				})
				this.score[this.playerTurn - 1].value++
				this.checkWin()
			} else {
				this.currentMoves.forEach((card) => {
					this.board[card.order].flipped = false
					setTimeout((cardElement = document.querySelector('[data-card-number="' + card.order + '"]')) => {
						cardElement.classList.remove('flipped')
						cardElement.querySelector('.back').innerHTML = ''
					}, 500)
				})
				if (this.players != 1) this.setPlayerTurn(this.playerTurn + 1)
			}

			this.moves.push(this.currentMoves)
			this.currentMoves = []
		}
	}

	sortWinners() {
		this.score.sort((a, b) => b.value - a.value)
		this.score.forEach((score, index) => {
			if (score.value === this.score[0].value) score.winner = true
		})
		console.log(this.score)
	}
	checkWin() {
		if (this.board.filter((card) => card.found === false).length === 0) {
			stopChrono()

			const popup = document.querySelector('.popup')

			if (this.players == 1) {
				popup.querySelector('.popup-header').innerHTML = `
					<h2 class="title">You did it!</h2>
					<p>Game over! Here's how you got on...</p>
					`
				popup.querySelector('.results').innerHTML = `
					<div class="result">time Elapsed <span class="time-elapsed font-big">${min}:${sec <= 9 ? '0' + sec : sec}</span></div>
					<div class="result">Moves Taken <span class="move-taken font-big">${this.move}</span></div>
					`
			} else {
				this.sortWinners()

				if (this.score.filter((score) => score.winner === true).length === 1) {
					popup.querySelector('.popup-header').innerHTML = `
						<h2 class="title">Player ${this.score[0].player} wins</h2>
						<p>Game over! Here are the results…</p>
						`
				} else {
					popup.querySelector('.popup-header').innerHTML = `
						<h2 class="title">It's a tie</h2>
						<p>Game over! Here are the results…</p>
						`
				}
				let finalScore = ''
				for (let i = 0; i < this.score.length; i++) {
					console.log(this.score[i])
					finalScore += `
					<div class="player${this.score[i].player} ${this.score[i].winner ? 'winner' : 'looser'} score result">
						player ${this.score[i].player} 
						${this.score[i].winner ? '(winner !)' : ''}
					<span class="player${this.score[i].player}-number font-big">
						${this.score[i].value} ${this.score[i].value > 1 ? 'Pairs' : 'Pair'}
					</span>
					</div>
				`
				}
				popup.querySelector('.results').innerHTML = finalScore
				this.setPlayerTurn(1)
			}

			document.body.classList.remove('in-game')
			document.body.classList.add('game-finished')
		}
	}
	handleClick(e) {
		if (e.target.classList.contains('card')) {
			if (!gameStarted && this.players == 1) launchChrono()

			const target = this.board[e.target.dataset.cardNumber]
			if (target.flipped || target.found) return
			target.flipped = true
			this.currentMoves.push(target)

			e.target.classList.add('flipped')
			this.theme === 'numbers' ? (content = target.value) : (content = `<i class="fa ${icons[target.value - 1]}"></i>`)
			e.target.querySelector('.back').innerHTML = content
			this.compareMoves()
			this.updateScores()
		}
	}
	setPlayerTurn(player) {
		if (player > this.players && this.players > 1) this.playerTurn = 1
		else this.playerTurn = player
		document.querySelectorAll('.score').forEach((score) => {
			score.classList.remove('active')
		})
		document.querySelector('.player' + this.playerTurn).classList.add('active')
	}
	updateScores() {
		if (this.players == 1) {
			document.querySelector('.move-number').innerHTML = this.move
		} else {
			document.querySelector('.player' + this.playerTurn + '-number').innerHTML = this.score[this.playerTurn - 1].value
		}
	}
}

submit.addEventListener('click', function (e) {
	e.preventDefault()
	startGame()
})

function launchChrono() {
	var chrono = document.querySelector('.time-number')
	interval = setInterval(function () {
		chrono.innerHTML = `${min}:${sec <= 9 ? '0' + sec : sec}`
		sec++
		if (sec === 60) {
			min++
			sec = 0
		}
	}, 1000)
	gameStarted = true
}
function stopChrono() {
	clearInterval(interval)
	gameStarted = false
}
let game
function startGame() {
	var options = document.querySelector('.game-options')
	const theme = options.elements['theme'].value
	const players = options.elements['players'].value
	const size = options.elements['size'].value

	game = new Game(players, theme, size)
	game.createCards(this.theme, this.size)
	game.shuffleCards()
	game.createBoard()
	game.setScores()

	document.body.classList.remove('in-setup')
	document.body.classList.add('in-game')

	gameState = 'ingame'
}
function restart() {
	if (gameState !== 'setup') {
		document.body.classList.remove('game-finished')
		document.querySelector('.menu-mobile-wrapper').classList.remove('show')
		clearGame()
		startGame()
	}
}
function newGame() {
	if (gameState !== 'setup') {
		clearGame()
		document.body.classList.remove('game-finished')
		document.body.classList.remove('in-game')
		document.querySelector('.menu-mobile-wrapper').classList.remove('show')
		document.body.classList.add('in-setup')
	}
}
function clearGame() {
	document.querySelector('.board').removeEventListener('click', game.boundEventHandler)
	if (game) {
		game.moves = null
		game.currentMoves = null
		game.move = 0
		game.score = []
		sec = 0
		min = 0
	}
	stopChrono()
}

function handleMenuMobile() {
	document.querySelector('.menu-mobile-wrapper').classList.toggle('show')
}
