import { useState, useEffect } from "react";
import api from "../../services/api";
import styles from "../Login/Login.module.css";
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const Conta = () => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await api.get('/usuarios/conta', { withCredentials: true });
        setUsuario(response.data);
      } catch (error) {
        console.error("Erro ao buscar dados da conta", error);
        setError("Erro ao carregar dados da conta.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <p>Carregando dados da conta...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <Header />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Bem-vindo, {usuario?.nome || "Usuário"}</h1>
        </div>

        <div className={styles.formContainer}>
          <h2>Informações de Conta</h2>
          <div className={styles.inputGroup}>
            <label>Email:</label>
            <p>{usuario?.email || "Email não informado"}</p>
          </div>
          <div className={styles.inputGroup}>
            <label>Endereço:</label>
            <p>{usuario?.endereco || "Não informado"}</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Conta;
