import React, { useState, useContext, useEffect } from 'react';
import Box from '@material-ui/core/Box';
import PreviewContext from '../components/PreviewContext';
import FragmentTextField from '../components/FragmentTextField';
import { imgUrlParamsToString } from '../utils/imgParamsUtils';

const FragmentParams = () => {
  const previewStateContext = useContext(PreviewContext);

  const [imgParametersJson, setImgParametersJson] = useState('');
  const [imgParameters, setImgParameters] = useState('');
  const [imgParametersPlain, setImgParametersPlain] = useState('');

  useEffect(() => {
    try {
      const tmpImgParametersJson: { [key: string]: string }[] = [];
      const tmpImgParameters: string[] = [];
      const tmpImgParametersPlain: string[] = [];
      previewStateContext.previewSet.forEach((v) => {
        const p = v.imageParams
          //https://stackoverflow.com/questions/26264956/convert-object-array-to-hash-map-indexed-by-an-attribute-value-of-the-object
          .reduce((m: { [key: string]: string }, v): {
            [key: string]: string;
          } => {
            m[v.key] = v.value;
            return m;
          }, {});
        tmpImgParametersJson.push(p);
        const u = new URL(v.previewUrl);
        tmpImgParameters.push(`${u.search.slice(1)}`);
        tmpImgParametersPlain.push(imgUrlParamsToString(v.imageParams, true));
      });
      setImgParametersJson(JSON.stringify(tmpImgParametersJson, null, ' '));
      setImgParameters(JSON.stringify(tmpImgParameters, null, ' '));
      setImgParametersPlain(JSON.stringify(tmpImgParametersPlain, null, ' '));
    } catch {
      setImgParametersJson('');
      setImgParameters('');
    }
  }, [previewStateContext.previewSet]);

  return (
    <Box mx={1}>
      <Box p={1}>
        <FragmentTextField
          defaultOpened
          label="json"
          value={imgParametersJson}
        />
      </Box>
      <Box p={1}>
        <FragmentTextField
          defaultOpened
          label="query (array)"
          value={imgParameters}
        />
      </Box>
      <Box p={1} display="none">
        <FragmentTextField
          defaultOpened
          label="query-plain (array)"
          value={imgParametersPlain}
        />
      </Box>
    </Box>
  );
};

export default FragmentParams;
