import { useEffect, useState } from 'react'
import { Animation } from '../../utility/Animation'
import { styled } from 'styled-components'

const StyledDiv = styled.div`
  ${(props) => `
  transform: scale(${props.$zoom});
  right: ${props.$zoom * 25}px;
  bottom: ${props.$zoom * 25}px;
  `}
  position: absolute;
  z-index: 20;
`

const SaveIndicator = () => {
  const scale = window.Graphics ? window.Graphics._realScale : 1

  const [saveIndicator, setSaveIndicator] = useState(false)
  const [showIndicator, setShowIndicator] = useState(false)

  window.$APP.indicators.onSaveStart = () => {
    setSaveIndicator(true)
  }
  window.$APP.indicators.onSaveEnd = () => {
    setSaveIndicator(false)
  }

  useEffect(() => {
    let removeIndicator = undefined

    if (!saveIndicator) {
      removeIndicator = setTimeout(() => {
        setShowIndicator(() => false)
      }, 500)
    } else {
      setShowIndicator(() => true)
    }

    return () => {
      if (removeIndicator) clearTimeout(removeIndicator)
    }
  }, [saveIndicator])

  return (
    <>
      {showIndicator && (
        <StyledDiv $zoom={scale}>
          <Animation
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
