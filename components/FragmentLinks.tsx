import React, { useState, useContext, useEffect } from 'react';
import Box from '@material-ui/core/Box';
import PreviewContext from '../components/PreviewContext';
import FragmentTextField from '../components/FragmentTextField';

const FragmentLinks = () => {
  const previewStateContext = useContext(PreviewContext);
  const [imgUrl, setImgUrl] = useState('');
  const [imgPath, setImgPath] = useState('');

  useEffect(() => {
    try {
      const tmpImgUrl: string[] = [];
      const tmpImgPath: string[] = [];
      previewStateContext.previewSet.forEach((v) => {
        tmpImgUrl.push(v.previewUrl);
        const u = new URL(v.previewUrl);
        tmpImgPath.push(`${u.pathname}${u.search}`);
      });
      setImgUrl(JSON.stringify(tmpImgUrl, null, ' '));
      setImgPath(JSON.stringify(tmpImgPath, null, ' '));
    } catch {
      setImgUrl('');
      setImgPath('');
    }
  }, [previewStateContext.previewSet]);

  return (
    <Box mx={1}>
      <Box p={1}>
        <FragmentTextField defaultOpened label="url (array)" value={imgUrl} />
      </Box>
      <Box p={1}>
        <FragmentTextField defaultOpened label="path (array)" value={imgPath} />
      </Box>
    </Box>
  );
};

export default FragmentLinks;
