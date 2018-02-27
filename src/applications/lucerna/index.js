import Store from './storage';
import App from './App.vue';
import Scheduller from './components/Scheduler.vue';
import Preferences from './components/Preferences.vue';
import Langs from './langs';

$includeLang(Langs);
$store.registerModule('lucerna', Store);
$exportComponent('lucerna-app', App);
$exportComponent('lucerna-preferences', Preferences);
$exportComponent('lucerna-scheduller', Scheduller);


