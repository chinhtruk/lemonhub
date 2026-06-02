// Thêm xử lý debug khi đăng nhập
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    setLoading(true);
    setError('');
    
    console.log('Logging in with email:', email);
    const data = await login(email, password);
    console.log('Login successful, received user data:', {
      id: data._id,
      name: data.name,
      hasToken: !!data.token,
      tokenLength: data.token ? data.token.length : 0
    });
    
    // Lưu userInfo vào localStorage
    localStorage.setItem('userInfo', JSON.stringify(data));
    
    // Cập nhật context state
    dispatch({
      type: 'USER_LOGIN_SUCCESS',
      payload: data,
    });
    
    // Thông báo đăng nhập thành công
    toast.success('Đăng nhập thành công!');
    
    // Chuyển hướng
    redirect();
  } catch (err) {
    console.error('Login error:', err);
    setError(
      err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.'
    );
  } finally {
    setLoading(false);
  }
}; 