import React, { useState } from 'react';
import Styles from '../Login/Login.module.css';
import Footer from '../../components/Footer';
import api from '../../services/api';
import PageContainer from '../../components/PageContainer';

const CadastroUsuario = () => {
    const [nome, setNome] = useState('');
    const [sobrenome, setSobrenome] = useState('');
    const [dataNascimento, setDataNascimento] = useState('');
    const [email, setEmail] = useState('');
    const [telefone, setTelefone] = useState('');
    const [senha, setSenha] = useState('');
    const [repetirSenha, setRepetirSenha] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Função para formatar telefone
    const formatTelefone = (value) => {
        // Remove tudo que não for número
        value = value.replace(/\D/g, '');
        // Aplica a máscara
        if (value.length > 11) value = value.slice(0, 11);
        if (value.length > 0) value = '(' + value;
        if (value.length > 3) value = value.slice(0, 3) + ') ' + value.slice(3);
        if (value.length > 10) value = value.slice(0, 10) + '-' + value.slice(10);
        else if (value.length > 6) value = value.slice(0, 6) + ' ' + value.slice(6);
        return value;
    };

    const handleTelefoneChange = (e) => {
        const formatted = formatTelefone(e.target.value);
        setTelefone(formatted);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        // Verifica se as senhas batem
        if (senha !== repetirSenha) {
            setMessage('As senhas não coincidem.');
            return;
        }

        setIsSubmitting(true);

        try {
            await api.post('/usuarios', {
                nome,
                sobrenome,
                dataNascimento,
                email,
                telefone,
                senha,
            });

            setMessage('Usuario criado com sucesso!');
            setNome('');
            setSobrenome('');
            setDataNascimento('');
            setEmail('');
            setTelefone('');
            setSenha('');
            setRepetirSenha('');
        } catch (error) {
            console.error('Erro ao criar usuario:', error);
            setMessage(error.response?.data?.message || 'Erro ao criar usuario');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
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
                            <input type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} required />
                        </div>
                        <div className={Styles.inputGroup}>
                            <label>E-mail:</label>
                            <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} required/>
                        </div>
                        <div className={Styles.inputGroup}>
                            <label>Telefone:</label>
                            <input
                                type="text"
                                value={telefone}
                                onChange={handleTelefoneChange}
                                maxLength={16}
                                placeholder="(99) 9 9999-9999"
                                required
                            />
                        </div>
                        <div className={Styles.inputGroup}>
                            <label>Senha:</label>
                            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
                        </div>
                        <div className={Styles.inputGroup}>
                            <label>Repetir Senha:</label>
                            <input type="password" value={repetirSenha} onChange={(e) => setRepetirSenha(e.target.value)} required />
                        </div>

                        <button type="submit" disabled={isSubmitting} className={Styles.button}>
                            {isSubmitting ? 'Enviando...' : 'Cadastrar'}
                        </button>

                        <p className={Styles.signupMessage}>Já tem uma conta? <a href="/login" className={Styles.link}>Faça login</a></p>
                    </form>
                    {message && <p style={{ color: message.includes('sucesso') ? 'green' : 'red' }}>{message}</p>}
                </div>
            </PageContainer>
            <Footer />
        </div>
    );
}

export default CadastroUsuario;
