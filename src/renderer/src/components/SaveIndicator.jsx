import { useEffect, useState } from 'react'
import { RingLoader } from 'react-spinners'
import { styled } from 'styled-components'

const StyledDiv = styled.div`
  position: absolute;
  z-index: 20;
  right: 25px;
  bottom: 25px;
`

const SaveIndicator = () => {
  const scale = window.Graphics ? window.Graphics._realScale : 1

  const [saveIndicator, setSaveIndicator] = useState(false)
  const [showIndicator, setShowIndicator] = useState(false)

  window.INDICATORS.startSaveIndicator = () => {
    setSaveIndicator(true)
  }
  window.INDICATORS.endSaveIndicator = () => {
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
    <StyledDiv>
      <RingLoader loading={showIndicator} size={75 * scale} color="#002aff" />
    </StyledDiv>
  )
}

export { SaveIndicator }
