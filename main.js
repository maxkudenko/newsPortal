const EventEmitter = require('./Eventemitter');
const User = require('./User');
const News = require('./News');
const http = require('http');
const fs = require('fs');
const path = require('path');

const users = [];
const newsPortal = [];
const emitter = new EventEmitter();

createUser('Tom', 1);
createUser('Bob', 2);
createUser('Sam', 'abc');
createNews('sport', 1);
createNews('it', 2);
writeNews(1, 'world cup');
writeNews(2, 'how to learn js');

function createUser(name, id) {
  let user = new User(name, id);
  users.push(user);
}

function createNews(name, id) {
  let news = new News(name, id);
  emitter.events[name] = [];
  newsPortal.push(news);
}

function getUserById(id) {
  id = checkId(id);
  return users.find( (user) => user.id === id);
}

function getNewsById(id) {
  id = checkId(id);
  return newsPortal.find( (news) => news.id === id);
}

function checkId(id) {
  if(Number(id)) {
    return Number(id);
  }
  return id;
}

function subscribe(newsId, userId) {
  let news = getNewsById(newsId);
  let user = getUserById(userId);
  if(news && user) {
    emitter.subscribe(news.name, user.getNews);
    user.subscription.push(news.id);
  }
}

function unsubscribe(newsId, userId) {
  let news = getNewsById(newsId);
  let user = getUserById(userId);
  if(news && user) {
    emitter.unsubscribe(news.name, user.getNews);
    user.subscription.splice(user.subscription.indexOf(news.id), 1);
  }
}

function writeNews(newsId, title) {
  let news = getNewsById(newsId);
  setInterval(() => {
    let article = news.generateArticle(title);
    emitter.emit(news.name, article);
  }, 10000);
}

function getUserSubscriptionById(userId) {
  let user = getUserById(userId);
  let result = [];
  for(let i = 0; i < user.subscription.length; i++) {
    let news = getNewsById(user.subscription[i]);
    if(news) {
      result.push({title: news.name, id: news.id});
    }
  }
  return result;
}

function writeFileAsync(user) {
  return new Promise( (resolve, reject) => {
    let data = JSON.stringify(user);
    fs.writeFile(path.normalize('db.json'), data, (err) => {
      if(err) throw err;
      resolve(data);
    });
  })
}

function readFileAsync() {
  return new Promise( (resolve, reject) => {
    fs.readFile(path.normalize('db.json'), {encoding: "utf8"}, (err, data) => {
      if(err) throw err;
      resolve(data);
    });
  })
}

function createAndRenderFile(userId) {
  let user = getUserById(userId);
  if(user) {
    return new Promise( (resolve, reject) =>  {
      writeFileAsync(user)
        .then((result) => readFileAsync(result))
        .then((result) => {
          resolve(result);
        })
    })
  }
}

const server = http.createServer( (req, res) => {

  if(req.method === 'GET') {

    let url = req.url.split('/').splice(1);

    if(url.length === 2 && url[0] === 'user') {
      let user = getUserById(url[1]);
      render(user);
    } else if(url.length === 2 && url[0] === 'news') {
      let news = getNewsById(url[1]);
      render(news);
    } else if(url.length === 3 && url[0] === 'user' && url[2] === 'subscription') {
      let subscription = getUserSubscriptionById(url[1]);
      render(subscription)
    } else if(url.length === 3 && url[1] === 'subscribe') {
      subscribe(url[0], url[2]);
      res.statusCode = 200;
      res.end();
    } else if(url.length === 3 && url[1] === 'unsubscribe') {
      unsubscribe(url[0], url[2]);
      res.statusCode = 200;
      res.end();
    } else if(url.length === 3 && url[0] === 'user' && url[2] === 'export') {
      createAndRenderFile(url[1])
        .then((result) => {
          res.writeHead(200, {'Content-Disposition' : 'attachment ; filename="filename.json"'});
          res.write(result);
          res.end();
        });
    } else {
      res.statusCode = 404;
      res.end('Not Found');
    }
  }

  function render(item) {
    if(item) {
      item = JSON.stringify(item);
      res.writeHead(200, {'Content-type': 'text/plain'});
      res.write(item);
      res.end();
    }
    res.statusCode = 404;
    res.end('Not Found');
  }

});

server.listen(3000, console.log('server is running'));