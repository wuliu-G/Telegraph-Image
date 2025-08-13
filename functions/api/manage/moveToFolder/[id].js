// Copyright (c) 2025 左岚. All rights reserved.
export async function onRequest(context) {
    const { request, params, env } = context;
    
    try {
        const url = new URL(request.url);
        const targetFolder = url.searchParams.get('targetFolder') || '';
        
        console.log("Moving file:", params.id, "to folder:", targetFolder);
        
        // 获取文件元数据
        const fileData = await env.img_url.getWithMetadata(params.id);
        
        if (!fileData || !fileData.metadata) {
            return new Response(JSON.stringify({ success: false, error: '文件不存在' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        
        // 如果目标文件夹不为空，验证文件夹是否存在
        if (targetFolder) {
            const folders = await env.img_url.list({ prefix: 'folder_' });
            const folderExists = folders.keys.some(key => {
                const metadata = key.metadata;
                return metadata && metadata.type === 'folder' && metadata.folderPath === targetFolder;
            });
            
            if (!folderExists) {
                return new Response(JSON.stringify({ success: false, error: '目标文件夹不存在' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        }
        
        // 更新文件的文件夹信息
        const updatedMetadata = {
            ...fileData.metadata,
            folderPath: targetFolder,
            movedAt: Date.now()
        };
        
        // 保存更新后的元数据
        await env.img_url.put(params.id, '', { metadata: updatedMetadata });
        
        console.log('File moved successfully:', updatedMetadata);
        
        return new Response(JSON.stringify({ 
            success: true, 
            folderPath: targetFolder 
        }), {
            headers: { 'Content-Type': 'application/json' },
        });
        
    } catch (error) {
        console.error('Move file error:', error);
        return new Response(JSON.stringify({ success: false, error: '移动文件失败' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
