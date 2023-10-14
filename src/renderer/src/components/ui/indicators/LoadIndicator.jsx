import { useState } from 'react'
import { CircleLoader } from 'react-spinners'
import { styled } from 'styled-components'

const StyledDiv = styled.div`
  position: absolute;
  padding: 5%;
  top: 50%;
  left: 50%;
  margin-right: -50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 20;
  background-color: black;
  font-size: xx-large;
  color: white;
  border-radius: 5%;
`

const StyledInnerDiv = styled.div`
  position: relative;
`

const StyledP = styled.p`
  position: absolute;
  top: 50%;
  left: 50%;
  margin-right: -50%;
  transform: translate(-50%, -50%);
`

const LoadIndicator = () => {
  const scale = window.Graphics ? window.Graphics._realScale : 1
  const [showIndicator, setShowIndicator] = useState(false)

  window.INDICATORS.startLoadIndicator = () => {
    setShowIndicator(() => true)
  }

  window.INDICATORS.endLoadIndicator = () => {
    setShowIndicator(() => false)
  }

  return (
    <>
      {showIndicator && (
        <StyledDiv>
          <StyledInnerDiv>
            <CircleLoader loading={showIndicator} size={300 * scale} color="#ffffff" />
            <StyledP>Loading...</StyledP>
          </StyledInnerDiv>
        </StyledDiv>
      )}
    </>
  )
}

export { LoadIndicator }
