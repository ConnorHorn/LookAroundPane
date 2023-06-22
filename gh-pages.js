var ghpages = require('gh-pages');

ghpages.publish(
    'public',
    {
        branch: 'gh-pages',
        repo: 'https://https://github.com/ConnorHorn/LookAroundPane.git',
        user: {
            name: 'ConnorHorn',
            email: 'connorhornet@gmail.com',

        },
        dotfiles: true
    },
    () => {
        console.log('Deploy Complete!');
    }
)