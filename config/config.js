module.exports = {
    git: {
        //repo con los json
        repo: "https://github.com/kevinrosenberg21/curso-microservices-config.git"
    },
    build:{
        static:"../resources/static",
        templates:"../resources/templates"
    },
    project: {
        info: {
            version: "0.0.1",
            title: "merged swaggers",
            description: "all mighty services merged together\n"
        },
        basePath: "/",
        schemes: ["http"],
        host: "hcwork.com",

        //solo identifica la carpeta en la que se va a clonear el git, despues se borra automaticamente
        name: "test-project"
    }
};