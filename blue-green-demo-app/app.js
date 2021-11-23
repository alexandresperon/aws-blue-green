const express = require('express')
const app = express()
const port = 8080

app.get('/', (req, res) => {
    res.json({"status": "OK", "version": "v1"});
})

app.listen(port, () => {
  console.log(`Demo app listening at http://localhost:${port}`)
})
