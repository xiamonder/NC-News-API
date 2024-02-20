const db = require("../../connection");

exports.fetchArticleById = (articleId) => {
    return db.query(`SELECT * FROM articles WHERE article_id = $1`, [articleId])
    .then(({rows})=>{
        if (rows.length === 0){
        return Promise.reject({status:404, msg: 'article not found'})
        }
        return rows [0]
    })
}