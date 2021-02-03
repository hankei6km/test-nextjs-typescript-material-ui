import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import Collapse from '@material-ui/core/Collapse';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import PreviewContext, {
  PreviewDispatch,
  BreakPoint,
  PreviewSetKind
} from '../components/PreviewContext';
import EnterPanel from '../components/EnterPanel';
import SamplePanel from '../components/SamplePanel';
import TemplateList from '../components/TemplateList';
import {
  ImportTemplateParametersSet,
  getImportTemplateItem
} from '../src/template';

const IndexPage = () => {
  const previewStateContext = useContext(PreviewContext);
  const previewDispatch = useContext(PreviewDispatch);
  const router = useRouter();

  const [selected, setSelected] = useState(false);
  const [open, setOpen] = useState<'' | 'template'>('');

  const [imageBaseUrl, setImageBaseUrl] = useState(
    previewStateContext.previewSetKind === 'recv'
      ? previewStateContext.imageBaseUrl
      : ''
  );
  const [previewSetKind, setPreviewSetKind] = useState<PreviewSetKind>('');

  const [templateIdx, setTemplateIdx] = useState(
    previewStateContext.templateIdx >= 0 ? previewStateContext.templateIdx : 0
  );
  const item = getImportTemplateItem(templateIdx);
  const [templateLabel, setTemplateLabel] = useState(item ? item.label : '');
  const [templateShortDescription, setTemplateShortDescription] = useState(
    item ? item.shortDescription || '' : ''
  );

  const [parametersSet, setParametersSet] = useState<
    ImportTemplateParametersSet
  >([]);
  const [medias, setMedias] = useState<BreakPoint[]>([]);

  useEffect(() => {
    previewDispatch({
      type: 'setTemplateIdx',
      payload: [templateIdx]
    });
    const item = getImportTemplateItem(templateIdx);
    if (item) {
      setTemplateLabel(item.label);
      setTemplateShortDescription(item.shortDescription || '');
      setParametersSet(item.parameters);
      setMedias(item.medias);
    }
  }, [previewDispatch, templateIdx]);

  useEffect(() => {
    return () => {
      if (imageBaseUrl !== '') {
        previewDispatch({
          type: 'setImageBaseUrl',
          payload: [previewSetKind, imageBaseUrl]
        });
        previewDispatch({
          type: 'resetPreviewSet',
          payload: []
        });
        previewDispatch({
          type: 'importPreviewSet',
          payload: ['data', imageBaseUrl, parametersSet, medias]
        });
      }
    };
  }, [
    previewDispatch,
    previewStateContext.imageBaseUrl,
    imageBaseUrl,
    previewSetKind,
    parametersSet,
    medias
  ]);

  useEffect(() => {
    if (selected) {
      router.push('/workbench');
    }
  }, [router, selected]);

  return (
    <Layout title="Home">
      <Container maxWidth="md">
        <Box>
          <Box>
            <Button
              endIcon={
                <ExpandMoreIcon
                  style={{
                    transform:
                      open === 'template'
                        ? 'rotate(180deg)'
                        : '' /*'rotate(270deg)'*/
                  }}
                />
              }
              onClick={() => setOpen(open ? '' : 'template')}
              style={{ textTransform: 'none' }}
            >
              <Box>
                <Box display="flex" justifyContent="flex-start">
                  <Typography variant="body1">{templateLabel}</Typography>
                </Box>
                <Box display="flex" justifyContent="flex-start">
                  <Typography variant="body2">
                    {templateShortDescription}
                  </Typography>
                </Box>
              </Box>
            </Button>
            <Collapse in={open === 'template'}>
              <TemplateList
                defaultIdx={templateIdx}
                onTemplate={({ templateIdx: idx }) => {
                  setTemplateIdx(idx);
                  setOpen('');
                }}
              />
            </Collapse>
          </Box>
          <Box mt={1}>
            <EnterPanel
              label="Enter image url or select sample"
              defaultValue={imageBaseUrl}
              disabled={selected}
              onSelect={({ value }) => {
                setImageBaseUrl(value);
                setPreviewSetKind('data');
                setSelected(true);
              }}
            />
          </Box>
          <Box mt={1}>
            <SamplePanel
              onSelect={({ value }) => {
                setImageBaseUrl(value);
                setPreviewSetKind('sample');
                setSelected(true);
              }}
            />
          </Box>
        </Box>
      </Container>
    </Layout>
  );
};

export default IndexPage;
