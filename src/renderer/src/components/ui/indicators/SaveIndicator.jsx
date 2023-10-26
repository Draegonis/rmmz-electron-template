import { useEffect, useState } from 'react'
import { AnimateSheet } from '../../utility/AnimateSheet'
import { styled } from 'styled-components'

/**
 * The styled-component handles the location on the screen.
 */
const StyledDiv = styled.div`
  ${(props) => `
  transform: scale(${props.$zoom});
  right: ${props.$zoom * 25}px;
  bottom: ${props.$zoom * 25}px;
  `}
  position: absolute;
  z-index: 20;
`

/**
 * A simple save animation shown when saving the game.
 * @returns {JSX.Element}
 */
const SaveIndicator = () => {
  const scale = window.Graphics ? window.Graphics._realScale : 1

  /**
   * saveIndicator is set from outside react in order to change the showIndicator.
   */
  const [saveIndicator, setSaveIndicator] = useState(false)
  /**
   * showIndicator is what the true control to show and hide the save indicator animation.
   */
  const [showIndicator, setShowIndicator] = useState(false)

  /**
   * called within the CoreManager when executing the 'save' task.
   */
  window.$APP.indicators.onSaveStart = () => {
    setSaveIndicator(true)
  }
  /**
   * called within the CoreManager when the 'save' task is done.
   */
  window.$APP.indicators.onSaveEnd = () => {
    setSaveIndicator(false)
  }

  useEffect(() => {
    /**
     * A timer to allow the save indicator to be on screen a little longer so it is visible by the player.
     * Most of the time in a simple game the indicator would only show for 100ms.
     */
    let removeIndicator = undefined

    if (!saveIndicator) {
      removeIndicator = setTimeout(() => {
        setShowIndicator(() => false)
      }, 500)
    } else {
      setShowIndicator(() => true)
    }

    return () => {
      // Clean up the timer if it not undefined.
      if (removeIndicator) clearTimeout(removeIndicator)
    }
  }, [saveIndicator])

  return (
    <>
      {showIndicator && (
        <StyledDiv $zoom={scale}>
          <AnimateSheet
            filename={'savingSheet.png'}
            duration={1}
            totalWidth={970}
            frames={10}
            width={97}
            height={52}
          />
        </StyledDiv>
      )}
    </>
  )
}

export { SaveIndicator }
