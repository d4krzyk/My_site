// sygnał startu animacji podstrony: od razu, a po przejściu kurtyną sigili dopiero gdy kurtyna zaczyna się podnosić
import { veilPhase } from './veil';

export function pageReady() {
  return new Promise(res => {
    const p = veilPhase();
    if (p !== 'in' && p !== 'hold') return res();
    const on = () => { removeEventListener('veil-open', on); res(); };
    addEventListener('veil-open', on);
    setTimeout(on, 8000);                      // bezpiecznik, gdyby kurtyna nie dała znać
  });
}
