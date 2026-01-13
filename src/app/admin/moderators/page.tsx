import { getModerators } from './actions';
import ModeratorsClient from './ModeratorsClient';

export default async function ModeratorsPage() {
  const moderators = await getModerators();

  return (
    <ModeratorsClient moderators={moderators} />
  );
}
