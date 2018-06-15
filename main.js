const EventEmmiter = require('./eventemmiter');
const User = require('./user');
const News = require('./news');
const http = require('http');
const fs = require('fs');
const path = require('path');

const users = [];
const newsPortal = [];
const emmiter = new EventEmmiter();

createUser('Tom', '1');
createUser('Bob', '2');
createNews('sport', '1', emmiter);
createNews('it', '2', emmiter);
subscribe('1', '1');
subscribe('2', '1');
subscribe('1', '2');
writeNews('sport', 'world cup');
writeNews('it', 'how to learn js');g
writeNews('sport', 'ronaldo');
writeNews('it', 'html');
writeNews('sport', 'messi');
writeNews('it', 'css');
unsubscribe(2, 1);


function createUser(name, id) {
  let user = new User(name, id);
  users.push(user);
}

function createNews(name, id, obj) {
  let news = new News(name, id, obj);
  newsPortal.push(news);
}

function subscribe(newsId, userId) {
  users.forEach( (user) => {
    if(user.id === userId) {
      newsPortal.forEach( (news) => {
        if(news.id === newsId) {
          emmiter.subscribe(news.theme, user.getNews);
          user.subscription.push(news.id);
        }
      })
    }
  })
}

function unsubscribe(newsId, userId) {
  users.forEach( (user) => {
    if(user.id === userId) {
      newsPortal.forEach( (news) => {
        if(news.id === newsId) {
          emmiter.unsubscribe(news.theme, user.getNews);
          user.subscription.splice(user.subscription.indexOf(news.id), 1);
        }
      })
    }
  })
}

function writeNews(theme, title) {
  newsPortal.forEach( (el) => {
    if(el.theme === theme) {
      let news = el.generateNews(title);
      emmiter.emit(theme, news);
    }
  })
}

function getUserById(id) {
  return users.filter( (el) => el.id === id);
}

function getNewsById(id) {
  return newsPortal.filter( (el) => el.id === id);
}

function getSubscriptionByUserId(userId) {
  let user = getUserById(userId)[0];
  let result = [];
  for(let i = 0; i < user.subscription.length; i++) {
    for(let k = 0; k < newsPortal.length; k++) {
      if(user.subscription[i] === newsPortal[k].id) {
        result.push({title: newsPortal[k].theme, id: newsPortal[k].id});
      }
    }
  }
  return result;
}

function createAndRenderFile(userId) {
  let user = getUserById(userId);
  return new Promise( (resolve, reject) => {
    fs.writeFile('db.json', `${JSON.stringify(user)}`, (err) => {
      if(err) throw err;
      fs.readFile('db.json', (err, data) => {
        if(err) throw err;
        data = JSON.stringify(data);
        resolve(data);
      })
    });
  })
}


const server = http.createServer( (req, res) => {

  let url = req.url.split('/').splice(1);
  console.log(url);

  if(url.length === 2 && url[0] === 'user') {
    let user = getUserById(url[1]);
    user = JSON.stringify(user);
    res.write(user);
    res.end();
  } else if(url.length === 2 && url[0] === 'news') {
    let news = getNewsById(url[1]);
    news = JSON.stringify(news);
    res.write(news);
    res.end();
  } else if(url.length === 3 && url[0] === 'user' && url[2] === 'subscription') {
    let subscription = getSubscriptionByUserId(url[1]);
    subscription = JSON.stringify(subscription);
    res.write(subscription);
    res.end();
  } else if(url.length === 3 && url[0] === 'user' && url[2] === 'export') {
    let exportUser = createAndRenderFile(url[1]);
    exportUser
      .then( (result) => {
        res.write(result);
        res.end();
      } )
  } else {
    res.statusCode = 501;
    res.end('Not implemented');
  }

});




server.listen(3000, console.log('server is running'));