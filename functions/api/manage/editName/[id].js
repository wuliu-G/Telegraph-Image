# Copyright(c) 2025 左岚.All rights reserved.
export async function onRequest(context) {
    const { request, params, env } = context;

    console.log("Request ID:", params.id);

    // 获取新文件名参数
    const url = new URL(request.url);
    const newName = url.searchParams.get('newName');
    
    if (!newName) {
        return new Response(JSON.stringify({ success: false, error: 'Missing newName parameter' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // 获取元数据
    const value = await env.img_url.getWithMetadata(params.id);
    console.log("Current metadata:", value);

    // 如果记录不存在，初始化默认元数据
    if (!value || !value.metadata) {
        const defaultMetadata = {
            TimeStamp: Date.now(),
            ListType: "None",
            Label: "None",
            liked: false,
            fileName: newName,
            fileSize: 0,
        };
        await env.img_url.put(params.id, "", { metadata: defaultMetadata });
        console.log("Created new metadata:", defaultMetadata);
        
        return new Response(JSON.stringify({ success: true, fileName: newName }), {
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // 更新文件名
    value.metadata.fileName = newName;
    await env.img_url.put(params.id, "", { metadata: value.metadata });

    console.log("Updated metadata:", value.metadata);

    return new Response(JSON.stringify({ success: true, fileName: value.metadata.fileName }), {
        headers: { 'Content-Type': 'application/json' },
    });
}
