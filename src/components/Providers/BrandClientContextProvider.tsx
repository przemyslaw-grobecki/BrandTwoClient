interface MyProviderProps {
    children: ReactNode;
}
  
  export const MyProvider: React.FC<MyProviderProps> = ({ children }) => {
    const [value, setValue] = useState<string>('default value');
  
    return (
      <MyContext.Provider value={{ value, setValue }}>
        {children}
      </MyContext.Provider>
    );
  };
  