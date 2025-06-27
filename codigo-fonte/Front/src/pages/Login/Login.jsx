import { useState } from 'react';
import api from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';
import Styles from'./Login.module.css';
import Footer from '../../components/Footer';  
import PageContainer from '../../components/PageContainer';
import Header from '../../components/Header1';

const Login = () => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [loginSucesso, setLoginSucesso] = useState(false);
    const [erroLogin, setErroLogin] = useState('');

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await api.post('/login', { email, senha });

            console.log('Login bem-sucedido', response.data);

            setLoginSucesso(true);
            setErroLogin('');

            alert('Login realizado com sucesso!');
            navigate(-1);

        } catch (error) {
            console.error('Erro no login', error);
            setErroLogin(error.response?.data.message || 'Erro no login');
            setLoginSucesso(false);
        }
    };

    return (
        <div>
            <Header />
            <PageContainer className={Styles.container}>
                {/* <div className={Styles.header}>
                    <h1>Bem-vindo de volta à <span className={Styles.highlight}>Confraria Vintage</span></h1>
                </div> */}
                <div className={Styles.formContainer}>
                    <h2>Login</h2>

                    <form onSubmit={handleLogin}>
                        <div className={Styles.inputGroup}>
                            <label htmlFor="email">E-mail</label>
                            <input 
                                id="email" 
                                type="email" 
                                placeholder="E-mail" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                />
                        </div>
                        <div className={Styles.inputGroup}>
                            <label htmlFor="senha">Senha</label>
                            <input 
                                id="senha" 
                                type="password" 
                                placeholder="Senha"
                                value={senha} 
                                onChange={(e) => setSenha(e.target.value)}
                                required
                                />
                        </div>
                        <button type="submit" className={Styles.button}>LOGIN</button>
                    </form>

                    {loginSucesso && <p className={Styles.successMessage}>Login realizado com sucesso!</p>}
                    {erroLogin && <p className={Styles.errorMessage}>{erroLogin}</p>}
                    <div className={Styles.links}>
                        <Link to="/cadastro-usuario" className={Styles.link}>
                            Cadastrar
                        </Link>
                        <span className={Styles.divider}>|</span>
                        <Link to="/esqueci-senha" className={Styles.link}>
                            Esqueci minha senha
                        </Link>
                    </div>
                </div>
            </PageContainer>
            <Footer />
        </div>
    );
};

export default Login;
