import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from './badge'

describe('Badge', () => {
  it('renders its children', () => {
    render(<Badge>Active</Badge>)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('applies the variant class for the requested variant', () => {
    render(<Badge variant="error">Critical</Badge>)
    expect(screen.getByText('Critical').className).toContain('text-error')
  })

  it('renders a decorative pulsing dot only for the live variant', () => {
    const { container, rerender } = render(<Badge variant="live">LIVE</Badge>)
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()

    rerender(<Badge variant="default">Idle</Badge>)
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument()
  })

  it('forwards additional className and props', () => {
    render(<Badge data-testid="badge" className="custom-class">Tagged</Badge>)
    expect(screen.getByTestId('badge')).toHaveClass('custom-class')
  })
})
