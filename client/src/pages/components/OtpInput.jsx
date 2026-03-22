import { useRef } from 'react'

const OtpInput = ({ length = 6, onChange }) => {
  const inputs = useRef([])

  const handleInput = (e, i) => {
    const val = e.target.value.replace(/\D/g, '')
    e.target.value = val
    if (val && i < length - 1) inputs.current[i + 1].focus()
    const otp = inputs.current.map(el => el.value).join('')
    onChange(otp)
  }

  const handleKeyDown = (e, i) => {
    if (e.key === 'Backspace' && !e.target.value && i > 0) {
      inputs.current[i - 1].focus()
      inputs.current[i - 1].value = ''
      onChange(inputs.current.map(el => el.value).join(''))
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    text.split('').forEach((ch, j) => { if (inputs.current[j]) inputs.current[j].value = ch })
    const next = inputs.current[Math.min(text.length, length - 1)]
    if (next) next.focus()
    onChange(text.padEnd(length, '').slice(0, length))
  }

  return (
    <div className="otp-boxes">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          className="otp-box"
          ref={el => inputs.current[i] = el}
          maxLength={1}
          inputMode="numeric"
          pattern="[0-9]"
          onInput={e => handleInput(e, i)}
          onKeyDown={e => handleKeyDown(e, i)}
          onPaste={handlePaste}
        />
      ))}
    </div>
  )
}

export default OtpInput