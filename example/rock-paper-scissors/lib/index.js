module.exports = {
  game: (userAction) => {
    let computerAction = Math.random()
    if (computerAction < 0.34) {
      computerAction = 'rock'
    } else if (computerAction <= 0.67) {
      computerAction = 'paper'
    } else {
      computerAction = 'scissors'
    }
    if (userAction === computerAction) {
      return 0
    } else if (
      (userAction === 'rock' && computerAction === 'scissors') ||
      (userAction === 'paper' && computerAction === 'rock') ||
      (userAction === 'scissors' && computerAction === 'paper')
    ) {
      return 1
    } else {
      return 2
    }
  },
}
