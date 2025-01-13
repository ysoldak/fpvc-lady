## Administartor panel local web GUI (experimental, under construction)
Before running the first time, be sure you have [Node.js](https://nodejs.org/en) installed.
When the repo is is cloned, navigate to the web GUI dir first:
```
cd \gui\
```

And then install all packages and dependencies:

```
npm install
```

### RUNNING THE PROJECT IN DEVELOPMENT MODE
Make sure that you are located in the `gui` dir:
```
cd \gui\
```

then start the project with:
```
npm run start
```

This will concurrently 3 React dev server on port 3000. It will automatically detect that it works in dev mode and will use whichever is set in `.env.development.local` under `REACT_APP_MOCK_WS_URL`. That's why this file is removed from gitignore. If you have the lady running on some other port - simply modify this entry before starting the project.

Navigate to the [localhost:3000](http://localhost:3000) address using your web-browser to access the web GUI.

### BUILDING THE PROJECT
When still in `gui` dir simply run the command:
```
npm run build
```
It will create the bundle with an `index.html` file and will immediately move the project to the `.\build\front` directory. This can be changed in `package.json` file under `buildDir`
