import { createBrowserRouter } from 'react-router';

import { Home } from './pages/Home';
import { Detail } from './pages/Detail';
import { NotFound } from './pages/NotFound';

const router = createBrowserRouter([
	{
		children: [
			{
				path: '/',
				element: <Home />,
			},
			{
				path: '/detail/:currency',
				element: <Detail />,
			},
			{
				path: '*',
				element: <NotFound />,
			},
		],
	},
]);

export { router };
