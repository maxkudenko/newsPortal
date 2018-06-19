class News {

  constructor(name, id) {
    this.name = name;
    this.id = id;
    this.articales = [];
  }

  generateArticle(title) {
    let news = {
      title,
      message: Math.random()
    };
    this.articales.push(news);
    return news;
  }

}

module.exports = News;