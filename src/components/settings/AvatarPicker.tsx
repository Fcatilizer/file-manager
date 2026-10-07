import { useId } from 'react'
import Avatar from '../Avatar'
import { AVATARS, type AvatarId } from '../../lib/avatars'

export default function AvatarPicker({ value, name, disabled, onChange }: { value: AvatarId; name: string; disabled: boolean; onChange: (id: AvatarId) => void }) {
  const groupName = useId()
  return <fieldset className="avatar-picker" disabled={disabled}>
    <legend>Choose your avatar</legend>
    <div className="avatar-picker__current"><Avatar avatar={value} name={name} /><span>{AVATARS.find(avatar => avatar.id === value)?.label}<small>Save your profile to use this across your devices.</small></span></div>
    {['Default', 'Characters', 'Gaming', 'Symbols'].map(group => <div className="avatar-picker__group" key={group}>
      <p>{group}</p><div className="avatar-picker__grid">{AVATARS.filter(avatar => avatar.group === group).map(avatar => <label className="avatar-picker__option" key={avatar.id}>
        <input type="radio" name={groupName} value={avatar.id} checked={value === avatar.id} onChange={() => onChange(avatar.id)} />
        <span className="avatar-picker__tile"><Avatar avatar={avatar.id} name={name} /><span>{avatar.label}</span></span>
      </label>)}</div>
    </div>)}
  </fieldset>
}
