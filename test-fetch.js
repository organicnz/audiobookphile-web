fetch('https://audiobookphile.foodshare.club/')
  .then(r => {
    console.log(r.status, r.statusText)
    return r.text()
  })
  .then(t => console.log(t.substring(0, 500)))
  .catch(e => console.error(e))
