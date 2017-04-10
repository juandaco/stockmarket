// Setup Colors
import {
  red200,
  pink200,
  purple200,
  deepPurple200,
  indigo200,
  blue200,
  lightBlue200,
  cyan200,
  teal200,
  green200,
  lightGreen200,
  lime200,
  yellow200,
  amber200,
  orange200,
  deepOrange200,
  brown200,
  blueGrey300,
  grey400,
} from 'material-ui/styles/colors';

const rndMuiColor = {
  colorArray: [
    red200,
    pink200,
    purple200,
    deepPurple200,
    indigo200,
    blue200,
    lightBlue200,
    cyan200,
    teal200,
    green200,
    lightGreen200,
    lime200,
    yellow200,
    amber200,
    orange200,
    deepOrange200,
    brown200,
    blueGrey300,
    grey400,
  ],

  getColor: function() {
    if (this.colorArray.length) {
      const randomIndex = Math.floor(Math.random() * this.colorArray.length);
      const colorValue = this.colorArray[randomIndex];
      this.colorArray.splice(randomIndex, 1);
      return colorValue;
    } else {
      this.colorArray = [
        red200,
        pink200,
        purple200,
        deepPurple200,
        indigo200,
        blue200,
        lightBlue200,
        cyan200,
        teal200,
        green200,
        lightGreen200,
        lime200,
        yellow200,
        amber200,
        orange200,
        deepOrange200,
        brown200,
        blueGrey300,
        grey400,
      ];
    }
  },
};

export default rndMuiColor;
