const supabaseUrl = 'https://heegwvbiipeleqbedqtj.supabase.co'; // あなたのSupabase URL
const supabaseKey = 'process.env.SUPABASE_KEY'; // あなたのSupabaseキー
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

const form = document.getElementById('postForm');
const userName = document.getElementById('userName');
const postText = document.getElementById('postText');
const imageInput = document.getElementById('imageInput');
const password = document.getElementById('password');
const postList = document.getElementById('postList');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = userName.value;
    const text = postText.value;
    const pass = password.value;
    const file = imageInput.files[0];

    // パスワードチェック
    if (pass !== 'wakakusa') {
        alert('パスワードが間違っています。');
        return;
    }

    // 画像アップロード処理
    let imageUrl = '';
    if (file) {
        const { data, error } = await supabase.storage.from('posts').upload(`public/${Date.now()}_${file.name}`, file);
        if (error) {
            alert('画像のアップロードに失敗しました。');
            return;
        }
        imageUrl = `${supabaseUrl}/storage/v1/object/public/posts/${data.path}`;
    }

    // 投稿データの保存
    const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert([{ name, text, image_url: imageUrl, password: pass }]);

    if (postError) {
        alert('投稿の保存に失敗しました。');
        return;
    }

    // フォームをリセット
    userName.value = '';
    postText.value = '';
    imageInput.value = '';
    password.value = '';

    // 新しい投稿を表示
    fetchPosts();
});

async function fetchPosts() {
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        alert('投稿の読み込みに失敗しました。');
        return;
    }

    postList.innerHTML = '';
    data.forEach(post => {
        const postElement = document.createElement('div');
        postElement.classList.add('post');
        postElement.innerHTML = `
            <p><strong>${post.name}</strong></p>
            <p>${post.text}</p>
            ${post.image_url ? `<img src="${post.image_url}" style="max-width: 100%; height: auto;"/>` : ''}
        `;
        postList.appendChild(postElement);
    });
}

fetchPosts();
