import React, { useState, useContext, useEffect } from 'react';
import ReactDomServer from 'react-dom/server';
import Box from '@material-ui/core/Box';
import Checkbox from '@material-ui/core/Checkbox';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Typography from '@material-ui/core/Typography';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import unified from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';
import format from 'rehype-format';
import rehypeSanitize from 'rehype-sanitize';
import PreviewContext, {
  PreviewItem,
  PreviewDispatch,
  getTargetItemIndex,
  imgWidthCss,
  allMatchAspectRatio
} from '../components/PreviewContext';
import { breakPointValue } from '../utils/intermediate';
import FragmentCodePanel from '../components/FragmentCodePannel';
import { ImgParamsValues } from '../utils/imgParamsUtils';
import merge from 'deepmerge';
import gh from 'hast-util-sanitize/lib/github.json';
import { Schema } from 'hast-util-sanitize';
import CodePenDefineForm from '../components/CodePen';
import TryItOn from '../components/TryItOn';

const schema = merge(gh, {
  tagNames: ['picture', 'source'],
  attributes: { source: ['srcSet', 'sizes'], img: ['srcSet', 'sizes'] }
});
const processorHtml = unified()
  .use(rehypeParse, { fragment: true })
  .use(rehypeSanitize, (schema as unknown) as Schema)
  .use(format)
  .use(rehypeStringify)
  .freeze();

const FragmentMakeTestbedPitureTag = () => {
  const previewStateContext = useContext(PreviewContext);
  const previewDispatch = useContext(PreviewDispatch);

  const [defaultItem, setDefaultItem] = useState<{
    itemKey: string;
    previewUrl: string;
    imageParams: ImgParamsValues;
    imgWidth: number;
    imgHeight: number;
  }>({
    itemKey: '',
    previewUrl: '',
    imageParams: [],
    imgWidth: 0,
    imgHeight: 0
  });

  const [disableWidthHeight, setDisableWidthHeight] = useState(
    previewStateContext.tagFragment.disableWidthHeight
  );
  const [pictureHtml, setPictureHtml] = useState('');

  useEffect(() => {
    const idx = getTargetItemIndex(
      previewStateContext.previewSet,
      previewStateContext.defaultTargetKey
    );
    if (idx >= 0) {
      setDefaultItem({
        itemKey: previewStateContext.defaultTargetKey,
        previewUrl: previewStateContext.previewSet[idx].previewUrl,
        imageParams: previewStateContext.previewSet[idx].imageParams,
        imgWidth: previewStateContext.previewSet[idx].imgWidth,
        imgHeight: previewStateContext.previewSet[idx].imgHeight
      });
    }
  }, [previewStateContext.previewSet, previewStateContext.defaultTargetKey]);

  useEffect(() => {
    const preViewSetWithoutDefault = previewStateContext.previewSet.filter(
      ({ itemKey }) => itemKey !== defaultItem.itemKey
    );
    const sourcesBucket: { [name: number]: PreviewItem[] } = {};
    preViewSetWithoutDefault.forEach((v) => {
      const w = imgWidthCss(v);
      if (w in sourcesBucket) {
        sourcesBucket[w].push(v);
      } else {
        sourcesBucket[w] = [v];
      }
    });
    const addAttrWidthHeigth =
      !disableWidthHeight &&
      allMatchAspectRatio(previewStateContext.previewSet);
    const pictureElement = (
      <div>
        <div>
          <p id="drp" />
        </div>
        <picture>
          {Object.keys(sourcesBucket)
            .map((v) => parseInt(v, 10))
            .sort((a, b) => b - a)
            .map((imgWidth) => {
              // sourcesBucket[v].map(({ previewUrl, imgWidth, media }, i) => {
              const mw = breakPointValue(
                sourcesBucket[imgWidth][0].media,
                imgWidthCss(sourcesBucket[imgWidth][0])
              );
              return (
                <source
                  key={imgWidth}
                  // src={`${previewUrl}`}
                  srcSet={sourcesBucket[imgWidth]
                    .map(
                      ({ previewUrl, imgDispDensity }) =>
                        `${previewUrl} ${imgDispDensity}x`
                    )
                    .join(',')}
                  // sizes={`(min-width: ${mw}px) ${imgWidth}px`}
                  media={`(min-width: ${mw}px)`}
                />
              );
            })}
          <img
            src={defaultItem.previewUrl}
            alt="preview in playground"
            width={addAttrWidthHeigth ? defaultItem.imgWidth : undefined}
            height={addAttrWidthHeigth ? defaultItem.imgHeight : undefined}
          />
        </picture>
      </div>
    );
    const html = ReactDomServer.renderToStaticMarkup(pictureElement);
    processorHtml.process(html, (err, file) => {
      if (err) {
        console.error(err);
      }
      setPictureHtml(
        `<form>
  Enter another image url: <input id="imgurl" />
  <button type="submit" id="run">run</button>
</form>` + String(file)
      );
    });
  }, [previewStateContext.previewSet, defaultItem, disableWidthHeight]);

  useEffect(() => {
    setDisableWidthHeight(previewStateContext.tagFragment.disableWidthHeight);
  }, [previewStateContext.tagFragment.disableWidthHeight]);
  useEffect(() => {
    previewDispatch({
      type: 'setTagFragment',
      payload: [
        previewStateContext.tagFragment.altText,
        previewStateContext.tagFragment.linkText,
        previewStateContext.tagFragment.asThumb,
        previewStateContext.tagFragment.newTab,
        previewStateContext.tagFragment.srcsetDescriptor,
        disableWidthHeight
      ]
    });
  }, [
    previewDispatch,
    previewStateContext.tagFragment.altText,
    previewStateContext.tagFragment.linkText,
    previewStateContext.tagFragment.asThumb,
    previewStateContext.tagFragment.newTab,
    previewStateContext.tagFragment.srcsetDescriptor,
    disableWidthHeight
  ]);

  return (
    <Box mx={1}>
      <Box p={1}>
        <TryItOn
          title="CodePen"
          linkButtons={[
            <CodePenDefineForm
              title="testbed (picture tag)"
              html={pictureHtml}
              js={`
              document.querySelector(
                "#user-content-drp"
              ).innerText = \`device pixel ratio=\${window.devicePixelRatio}\`;
              const imgurl = document.querySelector("#imgurl");
              const sources = document.querySelectorAll("source");
              const sourcesParams = [];
              sources.forEach((v) => {
                sourcesParams.push(v.srcset.split(", ").map((v) => v.split("?", 2)[1]));
              });
              const img = document.querySelector("img");
              const imgParams = img.src.split("?", 2)[1];
              const run = (e) => {
                const u = imgurl.value.split("?", 1)[0];
                sources.forEach((e, i) => {
                  e.srcset = sourcesParams[i].map((v) => \`\${u}?\${v}\`);
                });
                img.src = \`\${u}?\${imgParams}\`;
                e.preventDefault();
              };
              document.querySelector("form").onsubmit = run; `}
              buttonLabel={'make'}
              buttonProps={{
                color: 'primary',
                variant: 'contained',
                disableElevation: true,
                endIcon: <OpenInNewIcon />
              }}
            />
          ]}
        />
      </Box>
      <Box mx={2} p={1}>
        <FormControl component="fieldset">
          <FormLabel component="legend">
            <Typography color="textSecondary">
              width / height attributes
            </Typography>
          </FormLabel>
          <FormControlLabel
            control={
              <Checkbox
                color="primary"
                checked={disableWidthHeight}
                // defaultChecked={defaultDisableWidthHeight}
                onChange={(e) => setDisableWidthHeight(e.target.checked)}
              />
            }
            label="Disable"
          />
        </FormControl>
      </Box>
      <Box>
        <Box p={1}>
          <FragmentCodePanel
            naked
            label="picture tag source code"
            value={pictureHtml}
            language="html"
          />
        </Box>
      </Box>
    </Box>
  );
};

export default FragmentMakeTestbedPitureTag;
