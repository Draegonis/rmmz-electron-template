import { PropTypes } from 'prop-types'
import { styled } from 'styled-components'

// This is designed to use sprite sheets that have frames across the width, the height never changes.

const AnimatedDiv = styled.div`
  ${(props) => `
  width: ${props.$width}px;
  height: ${props.$height}px;
  background: transparent url(./ddmImg/animations/${props.$filename}) 0 0 no-repeat;
  animation: self ${props.$duration}s steps(${props.$frames}) infinite;
  `}
  @keyframes self {
    100% {
      ${(props) => `background-position: -${props.$totalWidth}px, 0;`}
    }
  }
`

const Animation = ({ filename, duration, totalWidth, frames, width, height }) => {
  return (
    <AnimatedDiv
      $filename={filename}
      $duration={duration}
      $totalWidth={totalWidth}
      $frames={frames}
      $width={width}
      $height={height}
    />
  )
}

Animation.propTypes = {
  filename: PropTypes.string,
  duration: PropTypes.number,
  totalWidth: PropTypes.number,
  frames: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number
}

export { Animation }
