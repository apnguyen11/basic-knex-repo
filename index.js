const fs = require('fs')
const mustache = require('mustache')
const cors = require('cors')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')

// const log = require('/.src/logging.js')

const dbConfigs = require('./knexfile.js')
const db = require('knex')(dbConfigs.development)
const session = require('express-session')
const port = 3000

// -----------------------------------------------------------------------------
// Express.js Endpoints

const homepageTemplate = fs.readFileSync('./templates/homepage.mustache', 'utf8')
const login = fs.readFileSync('./templates/login.mustache', 'utf8')

app.use(express.urlencoded())
app.use(bodyParser.urlencoded({extended: false}));

app.use(session({ ... }))

app.get('/', function (req, res) {

      res.send(mustache.render(login))
});

app.get('/cohorts', function (req, res) {
  getAllCohorts()
    .then(function (allCohorts) {
      res.send(mustache.render(homepageTemplate, { cohortsListHTML: renderAllCohorts(allCohorts) }))
    })
    // .catch(function(err){
    //   res.send(err)
    // })
})

// app.get('/', function (req, res) {
//   getAllStudents()
//     .then(function (allStudents) {
//       res.send(mustache.render(homepageTemplate, { studentListHTML: renderAllStudents(allStudents) }))
//     })
// })

app.post('/cohorts', function (req, res) {
  createCohort(req.body)
    .then(function () {
      res.send('hopefully we created your cohort <a href="/">go home</a>')
    })
    .catch(function () {
      res.status(500).send('something went wrong. waaah, waaah')
    })
})

// app.post('/students', function (req, res) {
//   createStudent(req.body)
//     .then(function () {
//       res.send('hopefully we created your student <a href="/">go home</a>')
//     })
//     .catch(function () {
//       res.status(500).send('something went wrong. waaah, waaah')
//     })
// })

app.get('/cohorts/:slug', function (req, res) {
  // console.log(res, "____________", req)
  getOneCohort(req.params.slug)
    .then(function (cohort) {
      // res.send('<pre>' + prettyPrintJSON(cohort) + '</pre>')
      res.send('<pre>' + prettyPrintJSON(cohort) +  '</pre>')
    })
    .catch(function (err) {
      res.status(404).send('cohort not found :(')
    })
})


app.get('/students/:id', function (req, res) {
  // console.log(res.name)
  // console.log(document.getElementById('studentId').value)
  console.log(req.params.id)
  getStudent(req.params.id)
    .then(function (student) {
      console.log(student)
      // res.send('<pre>' + prettyPrintJSON(cohort) + '</pre>')
      res.send('<pre>' + prettyPrintJSON(student) +  '</pre>')
    })
    .catch(function (err) {
      res.status(404).send('Student not found :(')
    })
})

app.listen(port, function () {
  console.log('Listening on port ' + port + ' 👍')
})

// -----------------------------------------------------------------------------
// HTML Rendering

function renderCohort (cohort) {
  return `<li><a href="/cohorts/${cohort.slug}">${cohort.title}</a></li>`
}

function renderStudent (students) {
  return `<li><a href="/students/${students.id}">${student.name}</a></li>`
}

function renderAllStudents(allStudents){
  return '<ul>' + allStudents.map(renderStudent).join('') + '</ul>'
}



function renderAllCohorts (allCohorts) {
  return '<ul>' + allCohorts.map(renderCohort).join('') + '</ul>'
}

// -----------------------------------------------------------------------------
// Database Queries

const getAllCohortsQuery = `
  SELECT *
  FROM Cohorts
`

function getAllCohorts () {
  return db.raw(getAllCohortsQuery)
}

function getOneCohort (slug) {
  return db.raw('SELECT * FROM Cohorts WHERE slug = ?', [slug])
    .then(function (results) {
      if (results.length !== 1) {
        throw null
      } else {
        return results[0]
      }
    })
}

function getAllStudents () {
  return db.raw('SELECT * FROM Students')
}

function getStudent (id) {
  return db.raw('SELECT * FROM Students WHERE id = ?', [id])
    // .then(function (results) {
    //   if (results.length !== 1) {
    //     throw null
    //   } else {
    //     return results[0]
    //   }
    // })
}

function createCohort (cohort) {
  return db.raw('INSERT INTO Cohorts (title, slug, isActive) VALUES (?, ?, true)', [cohort.title, cohort.slug])
}

function createStudent (cohort) {
  return db.raw('INSERT INTO Students (name, id, isActive) VALUES (?, ?, true)', [cohort.title, cohort.slug])
}

// -----------------------------------------------------------------------------
// Misc

function prettyPrintJSON (x) {
  return JSON.stringify(x, null, 2)
}
