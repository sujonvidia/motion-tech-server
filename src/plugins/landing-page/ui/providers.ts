import { registerReactFormInputComponent } from '@vendure/admin-ui/react';
import LandingFormInput from './components/LandingFormInput';

export default [
    registerReactFormInputComponent('landing-form-input', LandingFormInput),
];