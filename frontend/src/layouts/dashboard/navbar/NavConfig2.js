// routes
import { PATH_DASHBOARD } from '../../../routes/paths';

// components
import SvgIconStyle from '../../../components/SvgIconStyle';

// ----------------------------------------------------------------------

const getIcon = (name) => <SvgIconStyle src={`/icons/${name}.svg`} sx={{ width: 1, height: 1 }} />;


const ICONS = {
  user: getIcon('ic_user'),
  dashboard: getIcon('ic_dashboard'),
};

const navConfig2 = [
  // GENERAL
  // ----------------------------------------------------------------------
  {
    subheader: 'general',
    items: [
      { 
        title: 'app', 
        path: PATH_DASHBOARD.general.app, 
        icon: ICONS.dashboard,
        children: [
          { title: 'dashboard', path: PATH_DASHBOARD.general.app },
          { title: 'billing', path: PATH_DASHBOARD.general.billing },
          { title: 'social', path: PATH_DASHBOARD.general.social },
        ],
      },
    ],
  },
  
];




export default navConfig2;
