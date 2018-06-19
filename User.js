class User {

  constructor(name, id) {
    this.name = name;
    this.id = id;
    this.articales = [];
    this.subscription = [];
    this.getNews = this.getNews.bind(this);
  }

  getNews(data) {
    this.articales.push(data);
  }

}

module.exports = User;

