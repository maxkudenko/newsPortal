class News {

  constructor(theme, id, obj) {
    this.theme = theme;
    this.id = id;
    this.articales = [];
    this.obj = obj;
    this.obj.events[this.theme] = [];
  }

  generateNews(title) {
    let news = {
      title,
      message: Math.random()
    };
    this.articales.push(news);
    return news;
  }

}

module.exports = News;