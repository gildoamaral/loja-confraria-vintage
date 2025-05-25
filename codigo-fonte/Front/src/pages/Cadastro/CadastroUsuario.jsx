import React, { useState } from 'react';
import Styles from '../Login/Login.module.css';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import api from '../../services/api';
import PageContainer from '../../components/PageContainer';

const CadastroUsuario = () => {
    const [nome, setNome] = useState('');
    const [sobrenome, setSobrenome] = useState('');
    const [dataNascimento, setDataNascimento] = useState('');
    const [endereco, setEndereco] = useState([]);
    const [email, setEmail] = useState('');
    const [telefone, setTelefone] = useState('');
    const [senha, setSenha] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await api.post('/usuarios', {
                nome,
                sobrenome,
                dataNascimento,
                endereco,
                email,
                telefone,
                senha,
            });

            setMessage('Usuario criado com sucesso!');
            setNome('');
            setSobrenome('');
            setDataNascimento('');
            setEndereco('');
            setEmail('');
            setTelefone('');
            setSenha('');
        } catch (error) {
            console.error('Erro ao criar usuario:', error);
            setMessage(error.response?.data?.message || 'Erro ao criar usuario');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <Header />
            <PageContainer className={Styles.container}>
                <div className={Styles.header}>
                    {/* <img src={logo} alt="Logo AutoCare" className={styles.logo} /> */}
                    <h1>Crie agora sua conta na <span className={Styles.highlight}>Confraria Vintage</span></h1>
                    <h3>e redescubra sua feminilidade!</h3>
                </div>
                <div className={Styles.formContainer}>

                    <h2>Cadastre-se</h2>
                    <form onSubmit={handleSubmit}>
                        <div className={Styles.inputGroup}>
                            <label>Nome:</label>
                            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
                        </div>
                        <div className={Styles.inputGroup}>
                            <label>Sobrenome:</label>
                            <input type="text" value={sobrenome} onChange={(e) => setSobrenome(e.target.value)} required />
                        </div>
                        <div className={Styles.inputGroup}>
                            <label>Data de nascimento:</label>
                            <input type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} />
                        </div>
                        <div className={Styles.inputGroup}>
                            <label>Endereço:</label>
                            <input type="text" value={endereco} onChange={(e) => setEndereco(e.target.value)} />
                        </div>
                        <div className={Styles.inputGroup}>
                            <label>E-mail:</label>
                            <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className={Styles.inputGroup}>
                            <label>Telefone:</label>
                            <input type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
                        </div>
                        <div className={Styles.inputGroup}>
                            <label>Senha:</label>
                            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
                        </div>

                        <button type="submit" disabled={isSubmitting} className={Styles.button}>
                            {isSubmitting ? 'Enviando...' : 'Cadastrar'}
                        </button>

                        <p>Já tem uma conta? <a href="/login" className={Styles.signupLink}>Faça login</a></p>
                    </form>
                    {message && <p style={{ color: message.includes('sucesso') ? 'green' : 'red' }}>{message}</p>}
                </div>
            </PageContainer>
            <Footer />
        </div>
    );
}

export default CadastroUsuario;
