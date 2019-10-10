const fs = require('fs')
const mustache = require('mustache')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const passport = require('passport');
const mongoose = require('mongoose');
// const log = require('/.src/logging.js')

const dbConfigs = require('./knexfile.js')
const db = require('knex')(dbConfigs.development)

const port = 3000 || process.env.PORT;

// -----------------------------------------------------------------------------
// Express.js Endpoints
mongoose.connect('mongodb://localhost/MyDatabase');

const Schema = mongoose.Schema;
const UserDetail = new Schema({
  username: String,
  password: String
});

const UserDetails = mongoose.model('userInfo', UserDetail, 'userInfo');


app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({ extended: true}));



app.get('/success', (req, res) => res.send("You have successfully logged in"));
app.get('/error', (req, res) => res.send('error logging in'));

passport.serializeUser(function(user, cb){
  cb(null, user);
});

passport.deserializeUser(function(obj, cb){
  cb(null, obj);
});



const homepageTemplate = fs.readFileSync('./templates/homepage.mustache', 'utf8')
// const login = fs.readFileSync('./templates/login.mustache', 'utf8')

app.use(express.urlencoded())

app.get('/', (req, res) => res.sendFile('auth.html', {root: __dirname}));





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

// FACBOOK AUTH

const FacebookStrategy = require('passport-facebook').Strategy;

const FACEBOOK_APP_ID = '246507429625748';
const FACEBOOK_APP_SECRET = '228771890a1f88f85a66b446bd6b1121';

passport.use(new FacebookStrategy({
  clientID: FACEBOOK_APP_ID,
  clientSecret: FACEBOOK_APP_SECRET,
  callbackURL: "/auth/facebook/callback"
},
  function(accessToken, refreshToken, profile, cb){
    return cb(null, profile);
  }
));

app.get('/auth/facebook',
  passport.authenticate('facebook'));

  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/error'}),
    function(req, res){
      res.redirect('/sucess');
    });

    // GITHUB AUTH

    const GitHubStrategy = require('passport-github').Strategy;

    const GITHUB_CLIENT_ID = 'Iv1.ccf3b6ce10929198';
    const GITHUB_CLIENT_SECRET = 'e52b357794c9c26e2acac4affd15ed1d98bc3642';

    passport.use(new GitHubStrategy({
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: '/auth/github/callback'
    },
      function(accessToken, refreshToken, profile, cb){
        return cb(null, profile);
      }
    ));

    app.get('/auth/github',
      passport.authenticate('github'));

    app.get('/auth/github/callback',
      passport.authenticate('github', { failureRedirect: '/error'}),
      function(req, res){
        res.redirect('/success');
    });