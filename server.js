const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile.js')[environment];
const database = require('knex')(configuration)


const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use( bodyParser.json() );

app.set('port', process.env.port || 3000);

app.locals.title = 'NC Vineyards';


app.get('/', (request, response) => {
  response.status(200).send('NC Vineyards')
})

app.get('/api/v1/vineyards', (request, response) => {
  let queryString = request.query

  if(Object.keys(queryString).length) {
    let region;
    let vineyardName;
    if(queryString.region) {
      region = queryString.region.toLowerCase()
    }
    if(queryString.name) {
      vineyardName = queryString.name.toLowerCase()
    }
    database('vineyards').select()
      .then(vineyards => {
        let matchingVineyards = vineyards.filter(vineyard => {
          if (vineyard.region.toLowerCase() === region) {
            return vineyard
          } else if (vineyard.name.toLowerCase() === vineyardName) {
            return vineyard
          }
        })
        if (matchingVineyards.length) {
          response.status(200).json(matchingVineyards)
        } else {
          response.status(404).json({message: 'Could not find any resources matching your query, please check your query string and try again.'})
        }
      })
      .catch(error => {
        response.status(500).json(`Error retrieving data: ${error}`)
      })
  } else {
    database('vineyards').select()
      .then(vineyards => {
        response.status(200).json(vineyards);
      })
      .catch(error => {
        response.status(500).json(`Error retrieving data: ${error}`)
      })
  }
});

app.get('/api/v1/vineyards/:id', (request, response) => {
  const { id } = request.params
  database('vineyards').select()
  .then(vineyards => {
    let foundVineyard = vineyards.find(vineyard => {
      return vineyard.id === parseInt(id)
    })
    if(foundVineyard) {
      response.status(200).json(foundVineyard);
    } else {
      response.status(404).json({message: 'This id does not match an Id currently in the database, please resubmit request with correct id'})
    }
  })
  .catch(error => {
    response.status(500).json(`Error retrieving data: ${error}`)
  })
});

app.post('/api/v1/vineyards', (request, response) => {
  // add a vineyard assuming correct entry in body
  //return 201 successful creation, return id
  //return 422 cant make new entry with error message
  // catch 500
});

app.put('/api/v1/vineyards', (request, response) => {
  // fix information assuming correct entry-- Block efforts to change the id
  //return (201) for successful update return id
  // return (?ERROR) if cant successfully update, 
  //catch 500
});

app.delete('/api/v1/vineyards/:id', (request, response) => {
  let id = parseInt(request.params.id);
  database('vineyards').select()
    .then(vineyards => {
      const existingVineyard = vineyards.find(vineyard => {
        return id === vineyard.id
      })
      if(existingVineyard) {
        database('wines').where('vineyard_id', id).delete()
          .then(() => {
            database('vineyards').where('id', id).delete()
              .then(() => {
                response.status(200).json(`Successfully deleted vineyard with the id of ${id} as well as wines with the vineyard_id of ${id}`)
              })
            })
      } else {
        response.status(404).json(`Error on deletion: cannot find resource specified (vineyard id: ${id}). Check the id specified.`)
      }
    })
    .catch(error => {
      response.status(500).json({ error })
    })
});

app.get('/api/v1/wines', (request, response) => {
  database('wines').select()
  .then(wines => {
    response.status(200).json(wines);
  })
  .catch(error => {
    response.status(500).json(`Error retrieving data: ${error}`)
  })
  // add this to a test, eventhough we have it written
});

app.get('/api/v1/wines/:id', (request, response) => {
  const { id } = request.params
  database('wines').select()
  .then(wines => {
    let foundWine = wines.find(wine => {
      return wine.id === parseInt(id)
    })
    if(foundWine) {
      response.status(200).json(foundWine);
    } else {
      response.status(404).json({message: 'This id does not match an Id currently in the database, please resubmit request with correct id'})
    }
  })
  .catch(error => {
    response.status(500).json(`Error retrieving data: ${error}`)
  })
});

app.post('/api/v1/wines', (request, response) => {
  // add a vineyard assuming correct entry in body
  //return 201 successful creation, return id
  //return 422 cant make new entry with error message
  // catch 500
});

app.put('/api/v1/wines', (request, response) => {
  // fix information assuming correct entry-- Block efforts to change the id
  //return (201) for successful update return id
  // return (422) if cant successfully update, 
  //catch 500
});

app.delete('/api/v1/wines/:id', (request, response) => {
  let id = parseInt(request.params.id);
  database('wines').select()
    .then(wines => {
      const existingWine = wines.find(wine => {
        return id === wine.id
      })

      if (existingWine) {
        database('wines').where('id', id).delete()
        .then(wine => {
          response.status(200).json(`Successfully deleted wine with the id of ${id}`)
        })
      } else {
        response.status(404).json(`Error on deletion: cannot find resource specified (wine id: ${id}). Check the id specified.`)
      }
    })
    .catch(error => {
      response.status(500).json({ error })
    })
});



app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}`);
});

module.exports = app;
