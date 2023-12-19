# Multi line stock chart

- This is a clone of the HighCharts Stock chart as displayed here: https://www.highcharts.com/docs/stock/getting-started-stock

## Characteristics
- Navigator: Allows you to fine tune the range of the chart which is displayed
- Crosshair with tooltip: Shows a crosshair following the tooltip of a chart to better read results of the y and x axis
- Range selector (Zoom): Allows you to quickly select a range to be shown on the chart or specify the exact interval to be shown


## start the development server

```
yarn run dev
```
- Next, open your browser and visit http://localhost:5173/. The default React project will be running on port 5173

# Resources
- [How to set up a react project with vite](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-react-project-with-vite)
- [Installing Jest for Testing in Your Vite-React TypeScript Project](https://dev.to/hannahadora/jest-testing-with-vite-and-react-typescript-4bap)


## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
