module.exports = {
    apps: [
        {
            name: 'ndaf',
            script: 'index.js',
            env: {
            //Please use dotenv instead. Check the documentation for more
            },
            env_production: {
                NODE_ENV: 'production'
            }
        },
    ],
};
