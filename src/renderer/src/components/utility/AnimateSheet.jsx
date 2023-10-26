import { PropTypes } from 'prop-types'
import { styled } from 'styled-components'

/**
 * The styled-component that handles animating a sprite sheet that is only horizontal (y value never changing).
 * The url is set to find the file within public/ddmImg/animations folder.
 */
const AnimateSheetDiv = styled.div`
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

/**
 * A react component that displays a simple sprite sheet animation.
 * @param {{filename: string, duration: number, totalWidth: number, frames: number, width: number, height: number}} props
 * The props needed to create a css animation.
 *
 * - filename: the name of the file with extension.
 * - duration: the length in seconds of the frame.
 * - totalWidth: the width of the entire sprite sheet.
 * - frames: the total number of steps that the animation uses.
 * - width: the width of a single frame.
 * - height: the height of a single frame.
 * @returns {JSX.Element}
 */
const AnimateSheet = ({ filename, duration, totalWidth, frames, width, height }) => {
  return (
    <AnimateSheetDiv
      $filename={filename}
      $duration={duration}
      $totalWidth={totalWidth}
      $frames={frames}
      $width={width}
      $height={height}
    />
  )
}

AnimateSheet.propTypes = {
  filename: PropTypes.string,
  duration: PropTypes.number,
  totalWidth: PropTypes.number,
  frames: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number
}

export { AnimateSheet }
