import React, { useRef, useEffect, useState, useReducer } from 'react';
// import { makeStyles, useTheme } from '@material-ui/core/styles';
// import Skeleton from '@material-ui/lab/Skeleton';
import Box from '@material-ui/core/Box';
import LinearProgress from '@material-ui/core/LinearProgress';

type previewImgState = {
  state: 'loading' | 'done' | 'err';
  loadingUrl: string;
  previewUrl: string;
  width: string;
};

const initialState: previewImgState = {
  state: 'done',
  loadingUrl: '',
  previewUrl: '',
  width: '100%'
};

type actType = {
  type: 'setUrl' | 'setWidth' | 'loading' | 'done' | 'err';
  payload: [string];
};
function reducer(state: previewImgState, action: actType): previewImgState {
  const newState: previewImgState = { ...state };
  switch (action.type) {
    case 'setUrl':
      newState.loadingUrl = action.payload[0];
      if (newState.loadingUrl && newState.loadingUrl !== state.loadingUrl) {
        newState.state = 'loading';
      }
      break;
    case 'setWidth':
      if (newState.loadingUrl) {
        if (action.payload[0] === '100%') {
          newState.width = '100%';
        } else {
          newState.width = `${action.payload[0]}px`;
        }
      }
      break;
    case 'loading':
      if (newState.loadingUrl) {
        newState.state = 'loading';
      }
      break;
    case 'done':
      newState.state = 'done';
      newState.previewUrl = state.loadingUrl;
      break;
    case 'err':
      newState.state = 'err';
      break;
  }
  return newState;
}

export type ImgPreviewFitMode = 'landscape' | 'portrait';
export type ImgPreviewImgGrow = 'none' | 'y';
export type ImgPreviewProps = {
  previewUrl: string;
  fitMode: ImgPreviewFitMode;
  imgGrow: ImgPreviewImgGrow;
  position?: string;
  top?: number | string; // 必要なものだけ
  width?: number;
  height?: number;
};

export default function ImgPreview({
  previewUrl,
  fitMode = 'landscape',
  imgGrow = 'none',
  position,
  top,
  width,
  height
}: ImgPreviewProps) {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    const newState = { ...init };
    newState.loadingUrl = previewUrl;
    newState.state = 'loading';
    setTimeout(() => dispatch({ type: 'setUrl', payload: [previewUrl] }), 1); // dispatch でないと即時反映されない?
    return newState;
  });
  const [imgWidth, setImgWidth] = useState<string | number>(0);
  const [imgHeight, setImgHeight] = useState<string | number>(0);
  const outerEl = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    dispatch({ type: 'setUrl', payload: [previewUrl] });
    if (previewUrl) {
      const { width: outerWidth = 0, height: outerHeight = 0 } =
        outerEl.current?.getBoundingClientRect() || {};
      const img = new Image();
      const handleLoad = (e: Event) => {
        if (e.target) {
          let w = 0;
          let h = 0;
          if (fitMode === 'landscape') {
            w = outerWidth;
            h = (img.height * outerWidth) / img.width;
          } else {
            w = (img.width * outerHeight) / img.height;
            h = outerHeight;
          }
          if (imgGrow === 'none' && w > outerWidth) {
            h = (h * outerWidth) / w;
            w = outerWidth;
          } else if (imgGrow !== 'y' && h > outerHeight) {
            w = (w * outerHeight) / h;
            h = outerHeight;
          }
          setImgWidth(w);
          setImgHeight(h);
          dispatch({ type: 'setWidth', payload: [`${w}`] });
          dispatch({ type: 'done', payload: [''] });
        }
      };
      img.addEventListener('load', handleLoad);
      img.src = previewUrl;
      // 階層が深い位置にあるのが気になる
      return () => {
        img.removeEventListener('load', handleLoad);
      };
    } else {
      setImgWidth(width || 0);
      setImgHeight(height || 0);
      dispatch({ type: 'setWidth', payload: ['100%'] });
      dispatch({ type: 'done', payload: [''] });
    }
  }, [previewUrl, fitMode, imgGrow, width, height, outerEl]);

  return (
    <Box width={'100%'} height={height || '100%'} position={position} top={top}>
      <div
        ref={outerEl}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          height: '100%'
        }}
      >
        <Box display="flex" justifyContent="center" width="100%">
          <img
            src={state.previewUrl}
            width={imgWidth}
            height={imgHeight}
            alt=""
            onError={() => {
              dispatch({ type: 'err', payload: [''] });
            }}
          />
        </Box>
        <Box
          display="flex"
          justifyContent="center"
          style={{
            position: 'relative',
            bottom: 4,
            marginBottom: state.state === 'loading' ? -4 : 0,
            opacity: 0.5
          }}
        >
          {state.state === 'loading' && (
            <LinearProgress style={{ width: state.width }} />
          )}
        </Box>
      </div>
    </Box>
  );
}
