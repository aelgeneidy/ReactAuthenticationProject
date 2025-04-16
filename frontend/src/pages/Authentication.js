import { redirect } from 'react-router-dom';

import AuthForm from '../components/AuthForm';

function AuthenticationPage() {
  return <AuthForm />;
}

export default AuthenticationPage;

export async function action({ request }) {
  const searchParams = new URL(request.url).searchParams;
  const mode = searchParams.get('mode') || 'login';
 
  if (mode !== 'login' && mode !== 'signup') {
    throw new Response(JSON.stringify({ message: 'Unsupported mode.' }, { status: 422 }));
  }

  const data = await request.formData();
  const authData = {
    email: data.get('email'),
    password: data.get('password')
  };
  console.log(authData);
  console.log(mode);

  const response = await fetch('http://localhost:5000/' + mode, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(authData)
  });

  if (response === 422 || response === 401) {
    return response;
  }

  if (!response.ok) {
    throw new Response(JSON.stringify({ message: 'Could not authenticate user.' }, { status: 500 }));
  }

  return redirect('/');
}