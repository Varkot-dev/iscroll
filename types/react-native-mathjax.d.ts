declare module 'react-native-mathjax' {
  import { ComponentType } from 'react';
  import { StyleProp, ViewStyle } from 'react-native';

  interface MathJaxProps {
    html: string;
    mathJaxOptions?: object;
    style?: StyleProp<ViewStyle>;
  }

  const MathJax: ComponentType<MathJaxProps>;
  export default MathJax;
}
